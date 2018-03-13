import React, { Component } from "react";
import { graphql, compose } from "react-apollo";
import PropTypes from "prop-types";
import PostActions from "./PostActions";
import {
    INSERT_MEDIA,
    UPLOAD_COVER_IMAGE
} from "../../../shared/queries/Mutations";
import FileExplorerModal from "../Modals/FileExplorerModal";

class FeaturedImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cover_image: this.props.post.cover_image,
            fileExplorerOpen: false
        };
        this.updateFeaturedImage = this.updateFeaturedImage.bind(this);
        this.toggleFileExplorer = this.toggleFileExplorer.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
    }

    async uploadImage(files) {
        const coverImage = await PostActions.uploadFile(
            files,
            this.props.insertMedia
        );
        this.updateFeaturedImage(coverImage);
    }

    updateFeaturedImage(coverImage) {
        this.props.updateFeaturedImage({
            id: this.props.post.id,
            cover_image: coverImage
        });
        this.setState({ cover_image: coverImage, fileExplorerOpen: false });
    }

    toggleFileExplorer() {
        this.setState({ fileExplorerOpen: !this.state.fileExplorerOpen });
    }

    render() {
        const { t } = this.context;
        const coverImage =
            this.state.cover_image || "http://placehold.it/800x300";
        return (
            <div className="x_panel">
                <div className="x_content">
                    <div
                        className={
                            !this.state.cover_image ? "hide" : "featured-image"
                        }
                    >
                        <img alt="" width="100%" src={coverImage} />
                        {!this.state.cover_image ? (
                            <a
                                className="btn btn-xs btn-dark"
                                onClick={this.toggleFileExplorer}
                            >
                                {t("addFeaturedImg")}
                            </a>
                        ) : (
                            <a
                                className="btn btn-xs btn-dark"
                                onClick={_ => this.updateFeaturedImage("")}
                            >
                                {t("removeFeaturedImg")}
                            </a>
                        )}
                    </div>
                    <input
                        ref="uploadInput"
                        onChange={input => this.uploadImage(input.target.files)}
                        type="file"
                        className="hide"
                        name="uploads[]"
                        multiple="multiple"
                    />
                    {this.state.fileExplorerOpen && (
                        <FileExplorerModal
                            onClose={this.toggleFileExplorer}
                            onMediaSelect={this.updateFeaturedImage}
                            addNewMedia={_ => {
                                this.refs.uploadInput.click();
                                this.toggleFileExplorer();
                            }}
                        />
                    )}
                </div>
            </div>
        );
    }
}

const updateQueryWithData = graphql(UPLOAD_COVER_IMAGE, {
    props: ({ mutate }) => ({
        updateFeaturedImage: data =>
            mutate({
                variables: data,
                updateQueries: {
                    getPost: (prev, { mutationResult }) => {
                        const coverImage = mutationResult.data.uploadFile
                            ? mutationResult.data.uploadFile.cover_image
                            : "";
                        return {
                            post: {
                                ...prev.post,
                                cover_image: coverImage
                            }
                        };
                    }
                }
            })
    })
});

const insertMedia = graphql(INSERT_MEDIA, {
    props: ({ mutate }) => ({
        insertMedia: data => {
            mutate({
                variables: data
            });
        }
    })
});

FeaturedImage.contextTypes = {
    t: PropTypes.func
};

const Data = compose(updateQueryWithData, insertMedia);
export default Data(FeaturedImage);
