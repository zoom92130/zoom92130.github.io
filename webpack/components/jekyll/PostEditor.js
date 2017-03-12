import React, {Component, PropTypes} from 'react'
import RichTextEditor from 'react-rte'
import {TagListEditor} from 'react-tag-list-editor'
import {Form, Field} from 'simple-react-forms'

var yaml = require('js-yaml')
var removeDiacritics = require('diacritics').remove
var moment = require('moment')

class JekyllPostEditor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: RichTextEditor.createEmptyValue(),
            metadata: {
                layout: 'post',
                titre: '',
            },
            categories: [],
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.path != newProps.path) {
            this.setState({
                value: RichTextEditor.createEmptyValue(),
                categories: [],
                metadata: {
                    layout: 'post',
                    titre: '',
                },
            })
            this.reloadContent(newProps.path)
        }
    }

    reloadContent(path) {
        if (path) {
            this.props.setProgressStatus('progress', 'loading post {0}'.format(path) )
            this.props.loader.getContents(path, function (error, content) {
                if (error == null) {
                    this.loadContent(content)
                }
            }.bind(this))
        } else {
            this.loadContent('')
        }
    }

    onChange(value) {
        this.setState({
            value: value,
        });

        if (this.props.onChange) {
            // Send the changes up to the parent component as an HTML string.
            // This is here to demonstrate using `.toString()` but in a real app it
            // would be better to avoid generating a string on each change.
            this.props.onChange(
                value.toString('html')
            );
        }
    }

    setMarkdown(text) {
        this.props.setProgressStatus('reset')
        this.setState({
            value: RichTextEditor.createValueFromString(text, 'markdown'),
        })
    }

    loadContent(text) {
        var dashIndex = text.indexOf('---')
        if (dashIndex >= 0) {
            text = text.substring(dashIndex + 3, text.length)
            var endDashIndex = text.indexOf('---')
            if (endDashIndex >= 0) {
                var metadataStr = text.substring(0, endDashIndex)
                var metadata = yaml.safeLoad(metadataStr)
                if (!metadata.layout) {
                    metadata.layout = 'post'
                }
                if (!metadata.categories) {
                    metadata.categories = []
                }
                this.setState({
                    metadata: metadata,
                    categories: metadata.categories,
                })
                text = text.substring(endDashIndex + 3, text.length)
            }
        }
        this.setMarkdown(text)
    }

    setCategories(categories) {
        this.props.setProgressStatus('reset')
        this.state.metadata.categories = categories
        this.setState({
            categories: categories,
            status: null,
        })
    }

    setTitle(title) {
        this.props.setProgressStatus('reset')
        this.state.metadata.titre = title
        this.setState({
            metadata: this.state.metadata,
            status: null,
        })
    }

    onAddTag(value) {
        this.props.setProgressStatus('reset')
        this.setCategories(this.state.categories.concat(value))
    }

    onTagDelete(value) {
        this.props.setProgressStatus('reset')
        this.state.categories.splice(this.state.categories.indexOf(value), 1)
        this.setCategories(this.state.categories)
    }

    loaderCallback(error, response){
        if (error){
            this.props.setProgressStatus('error', error.message)
            this.setState({
                error: error.message,
                status: 'error',
            })
        }else {
            this.props.setProgressStatus('success')
        }
    }

    onDelete() {
        this.props.setProgressStatus('progress', 'Suppression du post {0}'.format(this.props.name))
        if (this.props.path) {
            this.props.loader.delete(this.props.path, this.loaderCallback.bind(this))
        }
    }

    onSave() {
        this.props.setProgressStatus('progress', 'Sauvegarde du post {0}'.format(this.props.name))
        var now = new Date()
        var date = this.state.metadata.date
        if (!date){
            date = now
            this.state.metadata.edited = moment(now).format("YYYY-MM-DD HH:mm")
        } else {
            date = new Date(date)
        }
        if (this.props.path){
            var path = this.props.path
        } else {
            var path = '_posts/{0}-{1}.md'.format(
                moment(date).format("YYYY-MM-DD"),
                removeDiacritics(this.state.metadata.titre).replace(new RegExp(/[^a-zA-Z0-9_-]/, 'g'), '-')
            )
        }
        if (this.props.onPostUpdated){
            this.props.onPostUpdated(path)
        }
        this.state.metadata.edited = moment(now).format("YYYY-MM-DD HH:mm")
        var content = "---\n{0}\n---\n{1}".format(
            yaml.safeDump(this.state.metadata),
            this.state.value.toString('markdown')
        )
        this.props.loader.setContents(path, content, this.loaderCallback.bind(this))
    }

    render() {
        var actions = []
        if (this.props.save) {
            actions.append(<i className="fa fa-cloud" aria-hidden="true"/>)
        }
        return (
            <div>
                <div className="btn-group-sm fa-3x">
                    <a className="btn btn-default" onClick={event => this.reloadContent(this.props.path)}>
                        <i className="fa fa-repeat fa-2x" aria-hidden="true"/>
                    </a>
                    <a className="btn btn-default" onClick={event => this.onSave()}>
                        <i className="fa fa-cloud  fa-2x" aria-hidden="true"/>
                    </a>
                    <a className="btn btn-danger" onClick={event => this.onDelete()}>
                        <i className="fa fa-trash-o  fa-2x" aria-hidden="true"/>
                    </a>
                </div>
                <Form ref="postDetails">
                    <Field
                        name="title"
                        label="Titre"
                        value={this.state.metadata.titre}
                        onChange={event => this.setTitle(event.target.value)}
                    />
                    <Field
                        name="categories"
                        label="Catégories"
                        element={
                            <TagListEditor className="form-control"
                                           placeholder="Categories"
                                           tags={this.state.metadata.categories}
                                           onTagDelete={tag => this.onTagDelete(tag)}
                                           onTagAdd={value => this.onAddTag(value)}/>
                        }
                    />
                </Form>
                <div >
                </div >

                < RichTextEditor
                    value={this.state.value}
                    onChange={this.onChange.bind(this)}
                />
            </div>
        );
    }
}

export default JekyllPostEditor